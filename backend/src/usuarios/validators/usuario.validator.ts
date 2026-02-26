import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Repository } from 'typeorm';
import { RoleEnum } from 'src/shared/entities/rol.entity';

@Injectable()
export class UsuarioValidator {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async validarUsuarioUnico(correo: string): Promise<void> {
    const usuarioExiste = await this.usuarioRepository.findOneBy({ correo });

    if (usuarioExiste) {
      throw new ConflictException(
        `Usuario con correo ${correo} ya existe en el sistema`,
      );
    }
  }

  validarEsOperador(usuario: Usuario): void {
    if (usuario.rol.nombre !== RoleEnum.OPERADOR) {
      throw new ForbiddenException(
        'Admin solo se pueden eliminar usuarios con rol OPERADOR',
      );
    }
  }
}
