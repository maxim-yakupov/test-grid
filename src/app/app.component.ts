import { Component, OnInit } from '@angular/core';
import { DataSource, DataSourceRequestParams } from './grid/data-source.model';
import { UserDto, UsersApi } from './services/users.api';
import { ColumnDefinition } from './grid/list-view/list-view.component';

class UsersDataSource implements DataSource<UserDto> {
  constructor(private userApi: UsersApi) {

  }

  getData(params: DataSourceRequestParams<UserDto>): void {
    this.userApi.getList({
      // @ts-ignore
      itemsPerPage: params.itemsPerPage,
      pageNumber: params.pageNumber,
      search: params.search
    }).subscribe({
      next: (response) => {
        params.onLoad({
          total: response.total_count,
          data: response.items,
        });
      },
      error: (err) => {
        params.onFail(err);
      }
    })
  }

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  usersDataSource?: UsersDataSource;
  columnDefinitions: ColumnDefinition<UserDto>[];

  constructor(private userApi: UsersApi) {
    this.columnDefinitions = [
      {
        name: 'user_name',
        title: 'Имя пользователя',
        getCellValue(user) {
            return user?.user_name ?? '-';
        },
      },
      {
        name: 'is_active',
        title: 'Статус',
        getCellValue(user) {
          if (!user) {
            return '-';
          }
          return user.is_active ? '✓' : '✘';
        },
      },
      {
        name: 'delete_user',
        title: ' ',
        getCellValue() {
          return 'Удалить';
        },
        action: (user) => {
          return this.userApi.remove(user.id);
        }
      }
    ];
  }

  ngOnInit(): void {
    this.usersDataSource = new UsersDataSource(this.userApi);  
  }

}
