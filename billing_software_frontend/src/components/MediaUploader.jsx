import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const isValidHttpUrl = (str) => {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

let uidCounter = 0;
const nextUid = () => `up-${Date.now()}-${uidCounter++}`;

export default function MediaUploader({
  type,          // "image" | "video"
  value = [],    // array of URL strings
  onChange,      // (urls: string[]) => void
  maxCount = 5,
  label = "Product Images",
}) {
  const [urls, setUrls] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");
  const [mediaState, setMediaState] = useState({}); // url -> "loading" | "error" | "ok"
  const [uploads, setUploads] = useState([]);        // { uid, status: "uploading" | "error" }
  const fileRef = useRef(null);
  const isVideo = type === "video";

  // Sync with the parent (covers edit-mode: previously saved URLs)
  useEffect(() => {
    const next = (Array.isArray(value) ? value : []).filter(Boolean);
    setUrls(next);
    setMediaState((prev) => {
      const seed = { ...prev };
      next.forEach((u) => { if (!(u in seed)) seed[u] = "loading"; });
      return seed;
    });
  }, [value]);

  const setStateFor = (url, state) =>
    setMediaState((prev) => ({ ...prev, [url]: state }));

  const removeUrl = (idx) => {
    const removed = urls[idx];
    setUrls((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (onChange) onChange(next);
      return next;
    });
    if (removed) {
      setMediaState((prev) => {
        const c = { ...prev };
        delete c[removed];
        return c;
      });
    }
  };

  const removeUpload = (uid) => {
    setUploads((prev) => prev.filter((u) => u.uid !== uid));
  };

  const handleUrlAdd = () => {
    const raw = urlInput.trim();
    if (!raw) return;
    if (!isValidHttpUrl(raw)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }
    if (urls.length + uploads.length >= maxCount) {
      setError(`You can add up to ${maxCount} ${isVideo ? "videos" : "images"}.`);
      return;
    }
    if (urls.includes(raw)) {
      setError("This URL is already in the gallery.");
      return;
    }
    setError("");
    setUrlInput("");
    setStateFor(raw, "loading");
    setUrls((prev) => {
      const next = [...prev, raw];
      if (onChange) onChange(next);
      return next;
    });
  };

  const handleFile = (file) => {
    if (!file) return;
    setError("");

    const count = urls.length + uploads.length;
    if (count >= maxCount) {
      setError(`You can add up to ${maxCount} ${isVideo ? "videos" : "images"}.`);
      return;
    }

    const uid = nextUid();
    setUploads((prev) => [...prev, { uid, status: "uploading" }]);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", isVideo ? "video" : "image");
    fd.append("folder", isVideo ? "products/videos" : "products/images");

    api
      .post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => {
        if (res.data && res.data.success && res.data.data && res.data.data.url) {
          const url = res.data.data.url;
          setUploads((prev) => prev.filter((u) => u.uid !== uid));
          setStateFor(url, "loading");
          setUrls((prev) => {
            const next = [...prev, url];
            if (onChange) onChange(next);
            return next;
          });
        } else {
          setUploads((prev) =>
            prev.map((u) => (u.uid === uid ? { ...u, status: "error" } : u))
          );
          setError(res.data?.message || "Upload failed.");
        }
      })
      .catch((err) => {
        console.error("Upload failed:", err);
        setUploads((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, status: "error" } : u))
        );
        setError("Upload failed. Please try again.");
      });
  };

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const maxReached = urls.length + uploads.length >= maxCount;

  return (
    <div className="pf-field">
      <label className="pf-label">{label}</label>

      <div className="mu-row">
        <button
          type="button"
          className="mu-upload"
          onClick={() => fileRef.current && fileRef.current.click()}
          disabled={maxReached}
        >
          <span className="mu-upload-icon">{isVideo ? "🎬" : "🖼️"}</span>
          <span>Upload {isVideo ? "Video" : "Image"}</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={isVideo ? "video/*" : "image/*"}
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        <div className="mu-url">
          <input
            className="mu-url-input"
            type="url"
            placeholder={
              isVideo
                ? "Paste video URL (mp4 / webm / mov)…"
                : "Paste image URL (https://…)"
            }
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); if (error) setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlAdd(); } }}
          />
          <button type="button" className="mu-add" onClick={handleUrlAdd} disabled={maxReached}>
            Add URL
          </button>
        </div>
      </div>

      {maxReached && (
        <span className="mu-hint">Maximum {maxCount} reached — remove one to add more.</span>
      )}

      {error && <p className="mu-error">{error}</p>}

      <div className="mu-grid">
        {urls.map((url, i) => {
          const state = mediaState[url] || "ok";
          return (
            <div className="mu-item" key={`${url}-${i}`}>
              {isVideo ? (
                <video
                  src={url}
                  controls
                  muted
                  onLoadedData={() => setStateFor(url, "ok")}
                  onError={() => setStateFor(url, "error")}
                />
              ) : (
                <img
                  src={url}
                  alt={`media ${i + 1}`}
                  onLoad={() => setStateFor(url, "ok")}
                  onError={() => setStateFor(url, "error")}
                />
              )}
              <button type="button" className="mu-x" onClick={() => removeUrl(i)}>✕</button>
              {state === "loading" && (
                <div className="mu-state">
                  <div className="mu-spinner" />
                  <span>Loading preview…</span>
                </div>
              )}
              {state === "error" && (
                <div className="mu-state mu-state-error">
                  {isVideo ? "Video could not be loaded." : "Image could not be loaded."}
                </div>
              )}
            </div>
          );
        })}

        {uploads.map((up) => (
          <div className="mu-item" key={up.uid}>
            <div className="mu-upload-bg" />
            {up.status === "uploading" ? (
              <div className="mu-state">
                <div className="mu-spinner" />
                <span>Uploading to Cloudinary…</span>
              </div>
            ) : (
              <div className="mu-state mu-state-error">
                Upload failed. Please try again.
              </div>
            )}
            <button type="button" className="mu-x" onClick={() => removeUpload(up.uid)}>✕</button>
          </div>
        ))}
      </div>

      <style>{`
        .mu-row { display: flex; gap: 8px; align-items: stretch; }
        .mu-upload {
          display: flex; align-items: center; gap: 8px;
          border: 1.5px solid #3271D7; background: #eef2ff; color: #3271D7;
          font-weight: 600; font-size: 13px; padding: 0 16px;
          border-radius: 10px; cursor: pointer; white-space: nowrap; font-family: inherit;
        }
        .mu-upload:hover:not(:disabled) { background: #e0e7ff; }
        .mu-upload:disabled { opacity: .55; cursor: not-allowed; }
        .mu-upload-icon { font-size: 15px; }
        .mu-url { flex: 1; display: flex; gap: 8px; }
        .mu-url-field { display: flex; gap: 8px; }
        .mu-url-input {
          flex: 1; padding: 9px 12px; font-size: 13px; font-family: inherit;
          border: 1.5px solid #c7d2fe; border-radius: 10px; outline: none;
          background: #fff; color: #0f172a;
        }
        .mu-url-input:focus { border-color: #3271D7; }
        .mu-add {
          border: none; cursor: pointer; white-space: nowrap;
          background: #eef2ff; color: #3271D7; font-weight: 600; font-size: 13px;
          padding: 0 14px; border-radius: 10px; font-family: inherit;
        }
        .mu-add:disabled { opacity: .55; cursor: not-allowed; }
        .mu-hint { font-size: 11.5px; color: #64748b; }
        .mu-error { color: #dc2626; font-size: 12px; margin: 6px 0 0; }
        .mu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; margin-top: 12px; }
        .mu-item { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; background: #f1f5f9; }
        .mu-item img, .mu-item video { width: 100%; height: 84px; object-fit: cover; display: block; background: #e2e8f0; }
        .mu-item video { height: 96px; }
        .mu-upload-bg { width: 100%; height: 96px; background: #e0e7ff; }
        .mu-x {
          position: absolute; top: 5px; right: 5px; width: 22px; height: 22px;
          border: none; border-radius: 50%; cursor: pointer; z-index: 2;
          background: rgba(15,23,42,.75); color: #fff; font-size: 11px; line-height: 1;
        }
        .mu-state {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
          background: rgba(241,245,249,.85); color: #334155; font-size: 10.5px; text-align: center; padding: 6px;
        }
        .mu-state-error { background: rgba(254,226,226,.92); color: #b91c1c; }
        .mu-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid #c7d2fe; border-top-color: #3271D7;
          animation: muSpin .7s linear infinite;
        }
        @keyframes muSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
