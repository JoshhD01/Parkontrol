import { RoleEnum } from 'src/shared/entities/rol.entity';
import { Usuario } from '../usuario.entity';

export class UsuarioResponseDto {
  id: number;
  nombre: string;
  correo: string;
  rol: RoleEnum;
  idEmpresa: number;

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.nombre = usuario.nombre;
    this.correo = usuario.correo;
    this.rol = usuario.rol.nombre;
    this.idEmpresa = usuario.empresa.id;
  }
}
