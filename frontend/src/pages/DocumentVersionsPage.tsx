import { useEffect, useState } from "react";
import { getDocumentVersions } from "../api/documentVersions";
import type { DocumentVersion } from "../types/documentVersion";

export default function DocumentVersionsPage() {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);

  useEffect(() => {
    getDocumentVersions().then(setVersions);
  }, []);

  return (
    <div>
      <h2>Document Versions</h2>

      <ul>
        {versions.map((v) => (
          <li key={v.id}>
            Document ID: {v.document} | v{v.version_number}
            <br />
            Uploaded by: {v.uploaded_by_username}
            <br />
            File: <a href={v.file} target="_blank">download</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
