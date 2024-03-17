import { BlockEditor } from 'gui/src/editor/BlockEditor'
import { useDarkmode } from 'gui/src/lib/use-dark-mode'
import { createPortal } from 'react-dom'
import { RenderDarkModeSwitcher } from 'gui/src/components/dark-mode'

function App(): JSX.Element {
  const darkModeHook = useDarkmode()

  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const DarkModeSwitcher = createPortal(
    <RenderDarkModeSwitcher hook={darkModeHook} />,
    document.body
  )

  return (
    <>
      {DarkModeSwitcher}
      <BlockEditor />
    </>
  )
}

export default App
