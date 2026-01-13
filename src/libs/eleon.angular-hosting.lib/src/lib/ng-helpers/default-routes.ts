
import { SignInComponent, ErrorEmptyComponent } from "../ng-components";

export const defaultRoutes = [
  {
    path: 'signin-oidc',
    component: SignInComponent,
  },
  {
    path: 'empty-error',
    component: ErrorEmptyComponent,
  },
];

