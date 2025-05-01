interface HelpCentreArticle {
  id: number;
  url: string;
  html_url: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  name: string;
  locale: string;
  snippet?: string;
}

export interface HelpCentreSearchResponse {
  count: number;
  next_page: string | null;
  page: number;
  page_count: number;
  per_page: number;
  previous_page: string | null;
  results: HelpCentreArticle[];
}

export interface HelpCentreArticleResponse {
  article: HelpCentreArticle;
}
