import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';
import { AVATAR_EXTENSIONS, avatarExtension } from '@/utils/avatarImage.utils';

const PROFILES_FOLDER = 'profiles';

const LEGACY_AVATARS_FOLDER = 'avatars';

const AVATAR_FILE = 'user_avatar';

const MANAGED_FOLDERS = [PROFILES_FOLDER, LEGACY_AVATARS_FOLDER];

const CACHE_CONTROL = 'public, max-age=604800';

export interface AvatarUpload {
  photoURL: string;
}

const avatarPath = (userId: string, extension: string) =>
  `${PROFILES_FOLDER}/${userId}/${AVATAR_FILE}.${extension}`;

const storagePathFromURL = (url: string | null | undefined): string | null => {
  if (!url) return null;

  try {
    const { pathname } = new URL(url);
    const encoded = pathname.split('/o/')[1];
    return encoded ? decodeURIComponent(encoded) : null;
  } catch {
    return null;
  }
};

const removePath = async (path: string | null) => {
  if (!path || !MANAGED_FOLDERS.some((folder) => path.startsWith(`${folder}/`))) return;

  try {
    await deleteObject(ref(storage, path));
  } catch {
    return;
  }
};

const clearAvatars = async (userId: string, keep?: string) => {
  await Promise.all(
    AVATAR_EXTENSIONS.map((extension) => avatarPath(userId, extension))
      .filter((path) => path !== keep)
      .map(removePath)
  );
};

const put = async (userId: string, file: File) => {
  const path = avatarPath(userId, avatarExtension(file.type));
  const objectRef = ref(storage, path);

  await uploadBytes(objectRef, file, {
    contentType: file.type,
    cacheControl: CACHE_CONTROL,
  });

  return { path, photoURL: await getDownloadURL(objectRef) };
};

export const avatarService = {
  async upload(
    userId: string,
    file: File,
    previousPhotoURL?: string | null
  ): Promise<AvatarUpload> {
    const { path, photoURL } = await put(userId, file);

    await updateDoc(doc(db, 'profiles', userId), {
      photoURL,
      photoSourceURL: null,
      updatedAt: serverTimestamp(),
    });

    await clearAvatars(userId, path);

    const previousPath = storagePathFromURL(previousPhotoURL);
    if (previousPath && previousPath !== path) await removePath(previousPath);

    return { photoURL };
  },

  async remove(userId: string, currentPhotoURL?: string | null): Promise<void> {
    await updateDoc(doc(db, 'profiles', userId), {
      photoURL: null,
      photoSourceURL: null,
      updatedAt: serverTimestamp(),
    });

    await clearAvatars(userId);
    await removePath(storagePathFromURL(currentPhotoURL));
  },
};
