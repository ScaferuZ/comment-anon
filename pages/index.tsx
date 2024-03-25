import { extractBody } from "@/utils/extractBody";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import { useMutation } from "react-query";

export default function Home() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (handle: string) => {
      return fetch("/api/pages", {
        method: "POST",
        body: JSON.stringify({ handle }),
      });
    },
    onSuccess: async (res) => {
      const body = await extractBody(res);
      const handle = body.handle;

      router.push(`/${handle}`);
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as HTMLFormElement);

    const handle = data.get("handle") as string;

    if (!handle) return;

    mutation.mutate(handle);
  }

  return (
    <main className="text-center p-5">
      <h1 className="mb-4 text-4xl font-extrabold dark:text-white">Ask Anonymously</h1>

      {mutation.isLoading && <p>Loading...</p>}

      {!mutation.isLoading && (
        <div className="w-full flex justify-center">
          <form className="w-full max-w-xs" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font0bold mb-2" htmlFor="handle">Handle</label>
              <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="handle" name="handle" type="text" placeholder="@dntinfern0" />
            </div>
            <div>
              <button className="bg-blue-500 rounded-xl shadow text-white py-2 px-4" type="submit">Create page</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
