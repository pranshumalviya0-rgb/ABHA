import {
  WireFrame,
  WireImage,
  WireInput,
  WireButton,
  WireLine,
  WireTitle,
} from "../../components/wire";

export default function WfLanding() {
  return (
    <WireFrame title="P1 · Landing & Gateway">
      <main className="mx-auto grid max-w-[1080px] gap-6 px-6 py-8 lg:grid-cols-2">
        {/* Left — Emergency */}
        <section className="rounded-sm border border-neutral-300 bg-white p-6">
          <WireTitle w="w-48" />
          <div className="mt-2 space-y-2">
            <WireLine w="w-full" />
            <WireLine w="w-4/5" />
          </div>
          <WireImage label="Scanner Viewport" className="mt-6 aspect-square w-full" />
          <div className="mt-6">
            <WireInput label="14-digit ID" />
          </div>
          <div className="mt-6">
            <WireButton label="Start / Next" solid full large />
          </div>
        </section>

        {/* Right — Standard login */}
        <section className="rounded-sm border border-neutral-300 bg-white p-6">
          <WireTitle w="w-36" />
          <div className="mt-2">
            <WireLine w="w-2/3" />
          </div>
          <div className="mt-6 space-y-4">
            <WireInput label="Label" />
            <WireInput label="Label" />
            <WireButton label="Continue" solid full large />
          </div>

          <div className="my-6 h-px bg-neutral-200" />

          <WireButton label="Create CliniKey" full />
          <div className="mt-4 flex justify-between">
            <WireLine w="w-20" />
            <WireLine w="w-20" />
          </div>
        </section>
      </main>
    </WireFrame>
  );
}
