/**
 * @param {Object} options
 * @param {String} options.cwd
 * @param {String} [options.config]
 */
export function type(options: {
    cwd: string;
    config?: string;
}): Promise<void>;
