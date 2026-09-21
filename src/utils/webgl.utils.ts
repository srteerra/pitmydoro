let supported: boolean | null = null;

const probe = (): { ok: boolean; reason: string } => {
  const canvas = document.createElement('canvas');
  let reason = '';

  const capture = (event: Event) => {
    reason = (event as WebGLContextEvent).statusMessage || '';
  };

  canvas.addEventListener('webglcontextcreationerror', capture);

  try {
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');

    return { ok: context !== null, reason };
  } catch (error) {
    return { ok: false, reason: reason || String(error) };
  } finally {
    canvas.removeEventListener('webglcontextcreationerror', capture);
  }
};

export const supportsWebGL = (): boolean => {
  if (supported !== null) return supported;
  if (typeof document === 'undefined') return false;

  const { ok, reason } = probe();
  supported = ok;

  if (!ok) {
    console.warn(
      `WebGL is unavailable, 3D badges will render flat. ${reason || 'No reason reported by the browser.'} ` +
        'Check chrome://gpu and enable graphics acceleration in chrome://settings/system.'
    );
  }

  return supported;
};

export const forgetWebGLSupport = () => {
  supported = false;
};
