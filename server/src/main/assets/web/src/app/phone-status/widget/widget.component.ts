import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StatusService } from '../status.service';
import { PhoneStatus } from '../models/phone-status';
import { PhoneInfo } from '../models/phone-info';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WidgetComponent implements OnInit {
  status: PhoneStatus = { percent: 0, scale: 100 };
  chargeMessage = "";
  statusClass = "";
  percent = "";

  loading = true;
  info: PhoneInfo = { };

  constructor(private svc: StatusService) { }

  ngOnInit() {

    this.svc.getPhoneInfo().subscribe(info => {
      this.info = info;
    });

    this.svc.getPhoneStatus().subscribe(status => {
      this.status = status;
      if (this.status.percent == 1) this.statusClass = "success";
      if (this.status.percent < 0.5) this.statusClass = "warning";
      if (this.status.percent < 0.20) this.statusClass = "danger";
      
      this.percent = (this.status.percent * this.status.scale).toFixed(1);
      
      const mode = status.chargeMode == "ac" ? "via charger" : "via USB";
      this.chargeMessage = `Charging ${mode}`;

      if (!status.charging) 
        this.chargeMessage = "Discharging";


      this.loading = false;
    })
  }

}
