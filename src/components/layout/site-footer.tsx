export function SiteFooter() {
  const name = process.env.NEXT_PUBLIC_AUTHOR_NAME ?? "Your Name";
  const github =
    process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/yourusername";
  const linkedin =
    process.env.NEXT_PUBLIC_LINKEDIN_URL ??
    "https://www.linkedin.com/in/yourprofile";

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <p>
          Built by{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {name}
          </span>{" "}
          · House of Edtech Assignment
        </p>
        <p className="flex flex-wrap gap-4">
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 hover:underline"
          >
            GitHub Profile
          </a>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 hover:underline"
          >
            LinkedIn Profile
          </a>
        </p>
      </div>
    </footer>
  );
}
