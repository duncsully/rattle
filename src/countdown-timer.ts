import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("countdown-timer")
export class CountdownTimer extends LitElement {
  @property({ type: Number }) duration = 30_000;

  @state()
  value = 0;

  start = 0;

  interval: number | null = null;

  constructor() {
    super();
    this.start = Date.now();
    // Can I initialize on the field?
    this.interval = setInterval(() => {
      this.value = Date.now() - this.start;
      if (this.value >= this.duration) {
        this.dispatchEvent(new Event("end"));
        clearInterval(this.interval!);
      }
    });
  }

  render() {
    return html`<progress
      .value=${this.value}
      .max=${this.duration}
    ></progress>`;
  }

  static styles = css`
    progress {
      width: 100%;
      height: 1em;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "countdown-timer": CountdownTimer;
  }
}
