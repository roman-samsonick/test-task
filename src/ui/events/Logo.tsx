import { useState } from 'react';

interface Props {
  url: string | null;
  alt: string;
}

/** Загруженного логотипа может не быть — вместо битой картинки остаётся кружок. */
export function Logo({ url, alt }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="logo">
      {url && !failed && (
        <img src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      )}
    </span>
  );
}
