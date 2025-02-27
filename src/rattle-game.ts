import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { map } from "lit/directives/map.js";
import words from "./words.json";
import { when } from "lit/directives/when.js";
import { styleMap } from "lit/directives/style-map.js";
import "./countdown-timer";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("rattle-game")
export class RattleGame extends LitElement {
  @state()
  private guesses = new Set<string>();

  @state()
  private stage: "pre" | "intro" | "playing" = "pre";

  private get score() {
    return Array.from(this.guesses).reduce((acc, guess) => {
      const vowels = guess.match(/[aeiou]/gi)?.length ?? 0;
      const consonants = guess.match(/[bcdfghjklmnpqrstvwxyz]/gi)?.length ?? 0;
      return acc + vowels - consonants;
    }, 0);
  }

  _startGame() {
    this.stage = "intro";
    this.guesses = new Set<string>();
  }

  render() {
    return html`
      <div class="card">
        <h1>Rattle</h1>

        ${choose(this.stage, [
          [
            "pre",
            () => html`<div>
              <button @click=${this._startGame}>Start</button>
              ${when(
                this.guesses.size,
                () => html`<p>Score: ${this.score}</p>`
              )}
            </div>`,
          ],
          [
            "intro",
            () =>
              html`<div>
                <p>
                  Enter words with more vowels than consonants. Earn points for
                  however many more vowels there are than consonants.
                </p>
                <countdown-timer
                  .duration=${5_000}
                  @end=${() => {
                    this.stage = "playing";
                  }}
                ></countdown-timer>
              </div>`,
          ],
          [
            "playing",
            () => html`<div>
              <countdown-timer
                .duration=${30_000}
                @end=${() => {
                  this.stage = "pre";
                }}
              ></countdown-timer>
              <form
                @submit=${(e: Event) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const guess = form.guess.value as string;
                  const lowercase = guess.toLowerCase();
                  const allWords = words as Record<string, number>;
                  if (allWords[lowercase]) {
                    this.guesses.add(lowercase);
                    this.guesses = new Set(this.guesses);
                  }

                  form.reset();
                }}
              >
                <input
                  name="guess"
                  type="text"
                  autocomplete="off"
                  autofocus
                  @input=${(e: Event) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^a-z]/gi, "");
                  }}
                />
              </form>
            </div>`,
          ],
        ])}
        <ul class="guesses">
          ${map(
            this.guesses,
            (guess) =>
              html`<li>
                ${guess.split("").map(
                  (char) =>
                    html`<span
                      style=${styleMap({
                        color: char.match(/[aeiou]/) ? "limegreen" : "inherit",
                      })}
                      >${char}</span
                    >`
                )}
              </li>`
          )}
        </ul>
      </div>
    `;
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .card {
      padding: 2em;
    }

    .guesses {
      display: flex;
      flex-direction: column-reverse;
      list-style-type: none;
      padding: 0;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    input {
      border-radius: 8px;
      border: 1px solid #1a1a1a;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-family: inherit;
      background-color: #f9f9f9;
      color: #1a1a1a;
      transition: border-color 0.25s;
    }

    @media (prefers-color-scheme: light) {
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "rattle-game": RattleGame;
  }
}
