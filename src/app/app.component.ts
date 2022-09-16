import { Component } from '@angular/core';
import { ApiService } from './services/api.service';
import { ConnectionService } from 'ngx-connection-service';
//Dexie
import { db } from './db';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-pwa-example';
  list: Array<any> = [];
  status: boolean = false;
  //conexion internet
  hasNetConnection: any;
  hasInternetAccess: any;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private connectionService: ConnectionService) {
    this.verificarSiHayInternet();
    this.obtenerListado();
  }

  verificarSiHayInternet() {
    //verificar si hay conexion de internet
    this.connectionService.updateOptions({
      heartbeatExecutor: options => new Observable<any>(subscriber => {
        if (Math.random() > .5) {
          subscriber.next();
          subscriber.complete();
        } else {
          console.log("Error connection")
        }
      })
    });

    this.connectionService.monitor().subscribe(data => {
      this.hasNetConnection = data.hasNetworkConnection;
      this.hasInternetAccess = data.hasInternetAccess;
      this.status = this.hasInternetAccess && this.hasNetConnection;
    })
  }

  obtenerListado() {
    this.apiService.listado()
      .subscribe((data: any) => {
        this.list = data
        db.items.bulkAdd(data)
      });
  }

  postSync = (data: any) => {
    const indexArray = this.list.findIndex(item => item.id === data.id);

    this.apiService.guardar(data).subscribe(
      (response: any) => {
        this.toastr.info("Se guardó correctamente....", "AVISO");
        data.completed = true;
        delete data.subtitle;
        this.list[indexArray] = data;
      },
      error => {
        this.toastr.error("No tiene conexión a Intenet", "AVISO")
        data.completed = true;
        this.list[indexArray] = { ...data, ...{ subtitle: "Guardado en Local..." } }
        this.addNewItem(data);
      }
    )
  }


  syncAll() {
    //Traer guardados localmente
    let listadoGuardadoLocal = this.list.filter(item => item.subtitle && item.subtitle === 'Guardado en Local...');
    if (listadoGuardadoLocal.length > 0) {
      listadoGuardadoLocal.forEach(element => {
        db.items.get(element.id)
          .then(
            response => {
              this.postSync(response);
            },
            error => {
              this.toastr.error("No se encontró item en BD local")
            }
          )
      });
    } else {
      this.toastr.error("No hay información que sincronizar")
    }
  }

  async addNewItem(item: any) {
    db.items.get(item.id)
      .then((response: any) => {
        //Si está se actualiza
        db.items.put(item);
      }).catch(error => {
        //si no está se agrega
        db.items.add(item);
      })
  }

  dejarDeEditar(item: any) {
    item.completed = true;
  }

}
