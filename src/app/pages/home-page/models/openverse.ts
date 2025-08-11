export interface Openverse {
  attribution: string;
  category: string | null;
  creator: string;
  creator_url: string;
  detail_url: string;
  fields_matched: string[];
  filesize: number | null;
  filetype: string | null;
  foreign_landing_url: string;
  height: number;
  id: string;
  indexed_on: string;
  license: string;
  license_url: string;
  license_version: string;
  mature: boolean;
  provider: string;
  related_url: string;
  source: string;
  tags: OpenverseTag[];
  thumbnail: string;
  title: string;
  unstable__sensitivity: any[];
  url: string;
  width: number;
}

export interface OpenverseTag {
  name: string;
  [key: string]: any;
}
