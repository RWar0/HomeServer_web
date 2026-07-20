import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmSidebarTrigger } from '@spartan-ng/helm/sidebar';
import { Sidebar } from '../../components/sidebar/app-sidebar/app-sidebar';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, Sidebar, HlmSidebarTrigger],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
