export interface StatusResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  status: {
    indicator: string;
    description: string;
  };
}

export interface Incident {
  name: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  impact: string;
}

export interface IncidentsResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  incidents: Array<Incident>;
}
