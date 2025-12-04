import { useState } from 'react';
import toast from 'react-hot-toast';

export default function FileUpload() {

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setUrl(data.url);
      toast.success('Файл успешно загружен!');
    } catch (error: any) {
      toast.error('Ошибка загрузки: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])}
        accept="image/*,.pdf"
      />
      <button type="submit" disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {url && (
        <div>
          <p>File URL:</p>
          <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
        </div>
      )}
    </form>
  );
}