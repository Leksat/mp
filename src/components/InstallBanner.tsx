import '@khmyznikov/pwa-install'
import type { PWAInstallElement } from '@khmyznikov/pwa-install'
import { useRef } from 'react'
import { DownloadIcon } from './icons'

const MANIFEST_URL = `${import.meta.env.BASE_URL}manifest.webmanifest`

const InstallBanner = () => {
  const dialog = useRef<PWAInstallElement>(null)

  return (
    <>
      <button
        type="button"
        className="install-banner"
        onClick={() => dialog.current?.showDialog(true)}
      >
        <DownloadIcon size={20} />
        Install app
      </button>

      <pwa-install
        ref={dialog}
        manual-apple="true"
        manual-chrome="true"
        manifest-url={MANIFEST_URL}
      />
    </>
  )
}

export default InstallBanner
