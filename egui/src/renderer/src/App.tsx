import { BlockEditor } from 'gui/src/editor/BlockEditor'
import { RecoilRoot } from 'recoil'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <RecoilRoot>
        <BlockEditor />
      </RecoilRoot>
    </>
  )
}

export default App
