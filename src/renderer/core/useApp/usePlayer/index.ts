import { createAudio } from '@renderer/plugins/player'
import useMediaDevice from './useMediaDevice'
import usePlayerEvent from './usePlayerEvent'
import usePlayer from './usePlayer'
import usePlayStatus from './usePlayStatus'
import useLastfm from './useLastfm'

export default () => {
  createAudio()

  usePlayerEvent()
  useLastfm()
  useMediaDevice() // 初始化音频驱动输出设置
  usePlayer()
  const initPlayStatus = usePlayStatus()

  return () => {
    void initPlayStatus()
  }
}
