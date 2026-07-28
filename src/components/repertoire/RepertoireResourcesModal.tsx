import type { RepertoireItem } from "@/types/repertoire";

interface RepertoireResourcesModalProps {
  item: RepertoireItem;
  onClose: () => void;
}

export default function RepertoireResourcesModal({
  item,
  onClose,
}: RepertoireResourcesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Biblioteca de recursos
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {item.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {item.composer ??
                "Compositor sin especificar"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg px-3 py-2 text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-lg font-bold text-slate-900">
              Recursos de la obra
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Aquí agregaremos la partitura, el
              audio, el video, la traducción, la
              pronunciación y las notas del
              director.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}