import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class RoleDirective implements OnInit {
  @Input('appHasRole') roles!: string[];

  private isVisible = false;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateView();

    // Update the view if the user's roles change
    this.authService.user$.subscribe(() => {
      this.updateView();
    });
  }

  private updateView(): void {
    const hasRole = this.checkRoles();

    if (hasRole && !this.isVisible) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasRole && this.isVisible) {
      this.viewContainerRef.clear();
      this.isVisible = false;
    }
  }

  private checkRoles(): boolean {
    if (!this.roles || this.roles.length === 0) {
      return true;
    }

    return this.roles.some(role => this.authService.hasRole(role));
  }
}
