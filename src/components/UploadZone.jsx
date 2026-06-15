import { useRef, useState } from 'react'

// Reusable drag-and-drop / click upload zone. Calls onFile(file) with the
// selected File. Optionally shows an image preview.
export default function UploadZone({ hint, accept, onFile, file, preview, icon = '📄' }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)

  function handleFiles(list) {
    if (list && list[0]) onFile(list[0])
  }

  return (
    <div
      className={`upload-zone ${drag ? 'is-drag' : ''} ${file ? 'has-file' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        handleFiles(e.dataTransfer.files)
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {preview ? (
        <img src={preview} alt="preview" className="upload-zone__preview" />
      ) : (
        <>
          <div className="upload-zone__icon">{icon}</div>
          <p className="upload-zone__hint">{hint}</p>
          {file && <p className="upload-zone__file">📎 {file.name}</p>}
        </>
      )}
    </div>
  )
}
