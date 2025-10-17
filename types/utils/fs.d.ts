/**
 * @param {String} directory
 * @returns {Promise<Boolean>}
 */
export function directoryExists (directory: string): Promise<boolean>
/**
 * @param {String} filepath
 * @returns {Promise<Boolean>}
 */
export function fileExists (filepath: string): Promise<boolean>
/**
 * @param {string} filepath
 * @returns {Promise<string|null>}
 */
export function readFile (filepath: string): Promise<string | null>
