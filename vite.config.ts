import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ビルド時の設定
  base: 'https://github.com/fre0ct20/docs/',

  build: {
    outDir: 'docs' // 出力先のフォルダをdocsに設定(gitに公開するため)　デフォルトはdist
  }
})
