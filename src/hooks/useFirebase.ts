'use client';
import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  setDoc,
  where,
  orderBy,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { limit } from '@firebase/firestore';
import _ from 'lodash';

export interface IQuery {
  type: 'where' | 'orderBy' | 'limit';
  field?: string;
  operator?:
    | '!='
    | '=='
    | '<'
    | '<='
    | '>'
    | '>='
    | 'array-contains'
    | 'in'
    | 'array-contains-any'
    | 'not-in';
  value?: any;
  direction?: 'asc' | 'desc';
  limit?: number;
}

interface IProps {
  collectionPath: string;
}

export const useFirebase = ({ collectionPath }: IProps) => {
  const getCollectionRef = () => {
    return collection(db, collectionPath);
  };

  const docWithId = async (path: string): Promise<any> => {
    const docRef = doc(db, path);
    const resp = await getDoc(docRef);

    return {
      ...(resp.data() ? { ...resp.data(), id: resp.id } : null),
    };
  };

  const getReference = (path: string) => {
    return doc(db, path);
  };

  const set = async (id: string, data: any, newCollectionPath?: string) => {
    const documentRef = doc(db, newCollectionPath || collectionPath, id);
    return setDoc(documentRef, data);
  };

  const collectionWithIds = async <Type>(
    queries: IQuery[] = [],
    distinctCollectionPath?: string
  ): Promise<Type[]> => {
    const snapshot = await getDocs(
      getQueryRef(queries, collection(db, distinctCollectionPath || collectionPath))
    );
    return snapshot.docs.map(
      (doc: any) =>
        ({
          ...doc.data(),
          id: doc.id,
          path: doc.ref.path,
        }) as any as Type
    );
  };

  const add = async (data: any, newCollectionPath?: string) => {
    const colRef = newCollectionPath ? collection(db, newCollectionPath) : getCollectionRef();

    return addDoc(colRef, {
      createdAt: Date.now(),
      trash: false,
      ...data,
    });
  };

  const update = async (id: string, data: any, path?: string) => {
    delete data['id'];

    const documentRef = doc(db, path || collectionPath, id);

    return updateDoc(documentRef, {
      ...data,
      updatedAt: Date.now(),
    });
  };

  const trash = async (docId: string, path?: string) => {
    return update(
      docId,
      {
        trash: true,
        deletedAt: Date.now(),
      },
      path
    );
  };

  const populate: any = async (
    items: any[],
    fields: string[],
    subFields: string[] = [],
    subSubFields: string[] = []
  ) => {
    return await Promise.all(
      items.map(async (item) => await populateByItem(item, fields, subFields, subSubFields))
    );
  };

  const populateByItem = async (
    item: any,
    fields: string[],
    subFields: string[] = [],
    subSubFields: string[] = []
  ) => {
    for (const field of fields) {
      if (item?.[field]) {
        try {
          const itemPath = item[field]?.path;

          if (itemPath) {
            item[field] = await docWithId(itemPath);
          }

          for (const subField of subFields) {
            if (item[field][subField]) {
              if (item[field][subField].path)
                item[field][subField] = await docWithId(item[field][subField].path);

              for (const subSUbField of subSubFields) {
                if (item[field][subField][subSUbField]) {
                  if (item[field][subField][subSUbField].path)
                    item[field][subField][subSUbField] = await docWithId(
                      item[field][subField][subSUbField].path
                    );
                }
              }
            }
          }
        } catch (e) {
          console.error(
            `Hubo un error al obtener el documento del campo ${field.toUpperCase()} para el path ${item[field]?.path}`,
            e
          );
        }
      }
    }
    return item;
  };

  const populateArrayFieldByItem = async (item: any, fields: string[]) => {
    for (const field of fields) {
      const array = _.get(item, field);
      if (array) {
        try {
          let populatedArray = await Promise.all(
            array.map(async (itemField: any) => {
              return await docWithId(itemField.path);
            })
          );

          populatedArray = populatedArray.filter((item: any) => !!item);

          _.set(item, field, populatedArray);
        } catch (e) {
          console.error(
            `Hubo un error al obtener el documento del campo ${field.toUpperCase()}`,
            e
          );
        }
      }
    }
    return item;
  };

  const populateArraySubFieldByItem = async (
    item: any,
    arrayFields: string[],
    subFields: string[]
  ) => {
    for (let i = 0; i < arrayFields.length; i++) {
      const arrayField = arrayFields[i];
      const array = _.get(item, arrayField);
      if (array) {
        try {
          let populatedArray = await Promise.all(
            array.map(async (itemField: any) => {
              return {
                ...itemField,
                [subFields[i]]: await docWithId(itemField[subFields[i]].path),
              };
            })
          );

          populatedArray = populatedArray.filter((item: any) => !!item[subFields[i]]);

          _.set(item, arrayField, populatedArray);
        } catch (e) {
          console.error(
            `Hubo un error al obtener el documento del campo ${arrayField.toUpperCase()}`,
            e
          );
        }
      }
    }
    return item;
  };

  const populateArrayByNestedField = async (
    items: any[],
    arrayField: string[],
    subFields: string[]
  ) => {
    return await Promise.all(
      items.map(async (item) => await populateArraySubFieldByItem(item, arrayField, subFields))
    );
  };

  const populateArrayField = async (items: any[], fields: string[]) => {
    return await Promise.all(
      items.map(async (item) => await populateArrayFieldByItem(item, fields))
    );
  };

  const populateArray = async (items: any[]) => {
    return await Promise.all(items.map(async (item) => await docWithId(item.path)));
  };

  const populateArrayOfArray = async (items: any[], fields: string[]) => {
    for (const item of items) {
      for (const field of fields) {
        if (!!item[field]) item[field] = await populateArray(item[field]);
      }
    }
    return items;
  };

  const getQueryRef = (queries: IQuery[] = [], distinctCollectionRef?: any) => {
    let queryRef: any = query(distinctCollectionRef || getCollectionRef());
    queries.forEach((queryItem) => {
      if (queryItem.field && queryItem.operator && queryItem.value && queryItem.limit) {
        if (queryItem.type === 'where') {
          queryRef = query(queryRef, where(queryItem.field, queryItem.operator, queryItem.value));
        } else if (queryItem.type === 'orderBy') {
          queryRef = query(queryRef, orderBy(queryItem.field, queryItem.direction));
        } else if (queryItem.type === 'limit') {
          queryRef = query(queryRef, limit(queryItem.limit));
        }
      }
    });

    return queryRef;
  };

  return {
    docWithId,
    getReference,
    set,
    populate,
    populateArrayField,
    populateArrayFieldByItem,
    populateArraySubFieldByItem,
    populateByItem,
    populateArrayByNestedField,
    populateArray,
    populateArrayOfArray,
    trash,
    collectionWithIds,
    update,
    add,
  };
};
