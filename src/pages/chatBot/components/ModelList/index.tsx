import { EMODELS } from "../../../../constants";

export default function ç() {
  return (
    <div>
      {Object.values(EMODELS).map((model) => (
        <div key={model} className="whitespace-nowrap">
          {model}
        </div>
      ))}
    </div>
  );
}
