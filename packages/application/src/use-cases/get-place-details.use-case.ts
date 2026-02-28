import type { IWikiProvider, WikiPageSummary } from "./services/wiki-provider";

export interface GetPlaceDetailsRequest {
  title: string;
  lang?: string;
}

export class GetPlaceDetailsUseCase {
  constructor(private wikiProvider: IWikiProvider) {}

  async execute(request: GetPlaceDetailsRequest): Promise<WikiPageSummary | null> {
    const title = request.title?.trim();
    if (!title) return null;

    const lang = request.lang ?? "pt";
    const ptResult = await this.wikiProvider.getPageSummary(title, lang);
    if (ptResult) return ptResult;

    if (lang === "pt") {
      const enResult = await this.wikiProvider.getPageSummary(title, "en");
      if (enResult) return { ...enResult, lang: "en" };
    }

    return null;
  }
}
