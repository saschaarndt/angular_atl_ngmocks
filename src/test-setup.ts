import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ngMocks } from 'ng-mocks';

ngMocks.globalKeep(ReactiveFormsModule);
ngMocks.globalKeep(RouterModule);
ngMocks.globalKeep(RouterOutlet);
