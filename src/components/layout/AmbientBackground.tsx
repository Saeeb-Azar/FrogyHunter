import { useSettingsStore } from '../../stores/settingsStore'

export function AmbientBackground() {
  const reduce = useSettingsStore((s) => s.reduceMotion)

  return (
    <div className="ambient" aria-hidden>
      <div className="ambient__sky" />
      <div className="ambient__sun" />
      <div className="ambient__clouds">
        <span className="ambient__cloud ambient__cloud--1" />
        <span className="ambient__cloud ambient__cloud--2" />
        <span className="ambient__cloud ambient__cloud--3" />
      </div>
      <div className="ambient__hills">
        <span className="ambient__hill ambient__hill--far" />
        <span className="ambient__hill ambient__hill--mid" />
        <span className="ambient__hill ambient__hill--front" />
      </div>
      {!reduce && (
        <div className="ambient__leafs">
          <span className="ambient__leaf" />
          <span className="ambient__leaf" />
          <span className="ambient__leaf" />
          <span className="ambient__leaf" />
          <span className="ambient__leaf" />
        </div>
      )}
    </div>
  )
}
