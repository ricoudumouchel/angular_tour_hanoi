import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisqueComponent } from './disque.component';

describe('DisqueComponent', () => {
  let component: DisqueComponent;
  let fixture: ComponentFixture<DisqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
