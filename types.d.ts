declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      src?: string;
      alt?: string;
      exposure?: string;
      "camera-controls"?: boolean;
      "auto-rotate"?: boolean;
      "disable-zoom"?: boolean;
      "disable-pan"?: boolean;
      "disable-tap"?: boolean;
      "field-of-view"?: string;
      "auto-rotate-delay"?: string;
      "rotation-per-second"?: string;
      "interaction-prompt"?: string;
      "shadow-intensity"?: string;
      slot?: string;
    };
  }
}

declare module 'reactflow/dist/style.css';
