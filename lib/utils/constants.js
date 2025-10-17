import path from 'bare-path'

export const dxvDirectory = path.join(path.dirname(new URL(import.meta.url).pathname), '../..')
