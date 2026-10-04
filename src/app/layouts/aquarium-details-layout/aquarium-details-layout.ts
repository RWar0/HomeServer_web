import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-aquarium-details-layout',
  imports: [RouterOutlet, HlmButtonImports, RouterLink, RouterLinkActive],
  templateUrl: './aquarium-details-layout.html',
  styleUrl: './aquarium-details-layout.css',
})
export class AquariumDetailsLayout {}
