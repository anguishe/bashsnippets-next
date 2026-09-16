const SUFFIX = ' | BashSnippets.xyz';

/**
 * Bing flags titles over 65 characters. Keep the root layout's brand suffix only
 * when it still fits; otherwise emit the bare title, which callers keep at 65 or under.
 */
export function fitTitle(title: string): string | { absolute: string } {
  return title.length + SUFFIX.length <= 65 ? title : { absolute: title };
}
