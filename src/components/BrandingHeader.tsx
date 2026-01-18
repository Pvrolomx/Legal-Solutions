import { brandingConfig } from '@/config/branding';

export default function BrandingHeader() {
  const { useCustomName, customName, customSubtitle, tagline, logoPath, logoAlt } = brandingConfig;

  return (
    <div className="text-center">
      {useCustomName && customName ? (
        <>
          <h1 className="text-2xl font-bold text-stone-800">{customName}</h1>
          <p className="text-stone-500 text-sm">{customSubtitle}</p>
          <p className="text-stone-400 text-xs mt-1">{tagline}</p>
        </>
      ) : (
        <>
          <img src={logoPath} alt={logoAlt} className="h-20 mx-auto mb-2" />
          <p className="text-stone-500 text-sm">{tagline}</p>
        </>
      )}
    </div>
  );
}
