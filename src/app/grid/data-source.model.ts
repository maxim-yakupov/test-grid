export interface DataSourceResponse<T> {
    total: number;
    data: T[];
}

export interface DataSourceRequestParams<T> {
    pageNumber: number;
    search?: string;
    itemsPerPage: number;

    onLoad(data: DataSourceResponse<T>): void;
    onFail(err: Error): void;
}

export interface DataSource<T> {
    getData(params: DataSourceRequestParams<T>): void;
}