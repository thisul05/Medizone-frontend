import { cardClass } from "./ui/Card";

const block = "animate-pulse rounded-md bg-(--surface-sunken)";

/** Shown while a customer profile loads. */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading customer profile">
      <div className={`${block} h-5 w-32`} />
      <div className={`${cardClass} flex gap-4 p-6`}>
        <div className={`${block} size-16 rounded-full`} />
        <div className="flex flex-1 flex-col gap-3">
          <div className={`${block} h-4 w-20`} />
          <div className={`${block} h-8 w-64`} />
          <div className={`${block} h-4 w-full max-w-md`} />
          <div className={`${block} h-4 w-full max-w-sm`} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${cardClass} h-32 p-5`}>
            <div className={`${block} h-3 w-24`} />
            <div className={`${block} mt-4 h-8 w-32`} />
          </div>
        ))}
      </div>
      <div className={`${cardClass} h-72`} />
    </div>
  );
}
