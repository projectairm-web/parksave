function isNative() {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();
}

async function compressDataUrl(dataUrl, maxW = 800, maxH = 600, quality = 0.6) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > maxW) { h = (h * maxW) / w; w = maxW; }
      if (h > maxH) { w = (w * maxH) / h; h = maxH; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

export async function capturePhoto() {
  if (isNative()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality:      50,
        allowEditing: false,
        resultType:   CameraResultType.Base64,
        source:       CameraSource.Camera,
      });
      return `data:image/jpeg;base64,${photo.base64String}`;
    } catch {
      return null;
    }
  }

  // Web: file input fallback
  return new Promise(resolve => {
    let settled = false;
    const done = (val) => { if (!settled) { settled = true; resolve(val); } };

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return done(null);
      const reader = new FileReader();
      reader.onload = async e => done(await compressDataUrl(e.target.result));
      reader.onerror = () => done(null);
      reader.readAsDataURL(file);
    };

    // File dialogs don't fire oncancel reliably — detect close via window refocus
    const onFocus = () => setTimeout(() => done(null), 400);
    window.addEventListener("focus", onFocus, { once: true });

    input.click();
  });
}
