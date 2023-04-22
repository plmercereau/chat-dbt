import { InvalidArgumentError } from '@commander-js/extra-typings'
import { spawn, execSync } from 'child_process'
import fs from 'fs'
import tmp from 'tmp'

export const parseInteger = (value: string): number => {
    const parsedValue = parseInt(value, 10)
    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError(`${value} is not a number`)
    }
    return parsedValue
}

/**
 * Open a file in the user's editor, and return its contents as a string.
 */
export const editFile = async ({
    contents,
    postfix
}: { contents?: string; postfix?: string } = {}): Promise<string> => {
    const tmpFile = tmp.fileSync({ postfix })

    if (contents) {
        fs.writeFileSync(tmpFile.name, contents)
    }

    const editor = execSync('git var GIT_EDITOR').toString().split(' ')
    var vim = spawn(editor[0], [...editor.slice(1), tmpFile.name], {
        stdio: 'inherit'
    })

    await new Promise(resolve => {
        vim.on('exit', () => {
            resolve(true)
        })
    })
    const result = fs.readFileSync(tmpFile.name).toString()
    tmpFile.removeCallback()
    return result
}
