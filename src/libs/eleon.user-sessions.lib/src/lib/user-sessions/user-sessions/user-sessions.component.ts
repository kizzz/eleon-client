import { Component, Input, OnInit } from '@angular/core';
import { SessionService, UserSessionDto } from '@eleon/system-services.lib';
import {
  LocalizedConfirmationService,
  LocalizedMessageService,
} from '@eleon/primeng-ui.lib';
import { catchError, finalize, throwError } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-user-sessions',
  templateUrl: './user-sessions.component.html',
  styleUrls: ['./user-sessions.component.css'],
})
export class UserSessionsComponent implements OnInit {
  @Input()
  userId?: string | null;

  protected loading: boolean = true;
  protected sessions: UserSessionDto[] = [];

  constructor(
    private sessionService: SessionService,
    private confirmationService: LocalizedConfirmationService,
    private messageService: LocalizedMessageService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  private loadSessions() {
    if (this.userId) {
      this.sessionService
        .getForUser(this.userId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((res) => {
          this.sessions = res;
        });
    } else {
      this.sessionService
        .getForCurrentUser()
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error(
              'TenantManagement::User:Session:LoadFailed'
            );
            return throwError(() => error);
          })
        )
        .subscribe((res) => {
          this.sessions = res.map((r) => {
            return {
              ...r,
              expiration: new Date(r.expiration).toLocaleString(),
              signInDate: new Date(r.signInDate).toLocaleString(),
              lastAccessTime: new Date(r.lastAccessTime).toLocaleString(),
            };
          });
        });
    }
  }

  refresh() {
    this.loading = true;
    this.loadSessions();
  }

  revokeSession(sessionId: any) {
    this.confirmationService.confirm(
      'TenantManagement::User:Session:RevokeConfirmation',
      () => {
        this.loading = true;
        this.sessionService
          .revoke(sessionId)
          .pipe(
            finalize(() => (this.loading = false)),
            catchError((error) => {
              this.messageService.error(
                'TenantManagement::User:Session:RevokeError'
              );
              return throwError(() => error);
            })
          )
          .subscribe(() => {
            this.messageService.success(
              'TenantManagement::User:Session:RevokeSuccess'
            );
            this.sessions = this.sessions.filter((s) => s.id !== sessionId);
          });
      }
    );
  }
}
