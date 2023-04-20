import type inquirer from 'inquirer'
import type { Answers, Question } from 'inquirer'
import InputPromptBase from 'inquirer/lib/prompts/input.js'
import observe from 'inquirer/lib/utils/events.js'
import type { Interface } from 'node:readline'

declare module 'inquirer' {
    interface InputHistoryPromptOptions<T extends Answers = Answers>
        extends InputQuestionOptions<T> {}

    /**
     * Provides options for the `InputHistoryPrompt`.
     *
     * @template T
     * The type of the answers.
     */

    interface InputHistoryPrompt<T extends Answers = Answers>
        extends InputHistoryPromptOptions<T> {
        /**
         * @inheritdoc
         */
        type: 'input-history'
        history: string[]
    }

    interface QuestionMap<T extends Answers = Answers> {
        /**
         * The `InputHistoryPrompt` type.
         */
        inputHistory: InputHistoryPrompt<T>
    }
}

/**
 * Positive modulo
 * @see https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
 */
const mod = (n: number, m: number) => ((n % m) + m) % m

export default class InputHistoryPrompt extends InputPromptBase {
    declare opt: inquirer.prompts.PromptOptions & {
        history: string[]
    }

    constructor(questions: Question, rl: Interface, answers: Answers) {
        super(questions, rl, answers)
    }
    private currentInput = ''
    private cursor = 0

    _run(done: (value: any) => void) {
        observe(this.rl).keypress.subscribe(({ key: { name } }) => {
            if (name === 'up' || name === 'down') {
                if (name === 'up') {
                    this.cursor--
                } else {
                    this.cursor++
                }
                const options = [
                    this.currentInput,
                    ...this.opt.history.filter(i =>
                        i.startsWith(this.currentInput)
                    )
                ]
                const idx = mod(this.cursor, options.length)
                // @ts-ignore
                this.rl.line = options[idx]
                this.rl.write(null, { ctrl: true, name: 'e' })
            } else {
                this.currentInput = this.rl.line
                this.cursor = 0
            }
        })

        return super._run(done)
    }
}
