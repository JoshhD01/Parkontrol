import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { CreateUsuarioDto } from './entities/dto/crear-usuario.dto';
import { RolesService } from 'src/shared/services/roles/roles.service';
import { UsuarioValidator } from './validators/usuario.validator';
import * as bcrypt from 'bcrypt';
import { UsuarioResponseDto } from './entities/dto/usuario-response.dto';
import { EmpresasService } from 'src/empresas/empresas.service';

type CrearUsuarioInput = Pick<
  CreateUsuarioDto,
  'nombre' | 'correo' | 'contrasena' | 'idEmpresa'
>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly usuarioValidator: UsuarioValidator,
    private readonly rolesService: RolesService,
    private readonly empresasService: EmpresasService,
  ) {}

  async crear(
    createUsuarioDto: CrearUsuarioInput,
    nombreRol: RoleEnum,
  ): Promise<UsuarioResponseDto> {
    await this.usuarioValidator.validarUsuarioUnico(createUsuarioDto.correo);
    const rol = await this.rolesService.findRoleByNombre(nombreRol);
    const empresa = await this.empresasService.findEmpresaById(
      createUsuarioDto.idEmpresa,
    );

    const saltRounds = 10;
    const hashedContrasena = await bcrypt.hash(
      createUsuarioDto.contrasena,
      saltRounds,
    );

    const usuario = this.usuarioRepository.create({
      nombre: createUsuarioDto.nombre,
      correo: createUsuarioDto.correo,
      contrasena: hashedContrasena,
      rol,
      empresa,
    });

    const usuarioGuardado = await this.usuarioRepository.save(usuario);
    return new UsuarioResponseDto(usuarioGuardado);
  }

  async findUsuarioByCorreo(correo: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { correo },
      relations: ['empresa'],
    });
    return usuario;
  }

  async findUsuarioById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['empresa', 'rol'],
    });
    if (!usuario) {
      throw new NotFoundException(`No existe usuario con id: ${id}`);
    }
    return usuario;
  }

  async findByEmpresa(idEmpresa: number): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuarioRepository.find({
      where: { empresa: { id: idEmpresa } },
      relations: ['empresa', 'rol'],
    });
    return usuarios.map((u) => new UsuarioResponseDto(u));
  }

  async eliminar(id: number): Promise<void> {
    const usuario = await this.findUsuarioById(id);
    this.usuarioValidator.validarEsOperador(usuario);
    await this.usuarioRepository.remove(usuario);
  }
}
