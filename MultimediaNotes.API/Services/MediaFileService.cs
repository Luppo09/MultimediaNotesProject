using AutoMapper;
using MultimediaNotes.API.DTOs;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.Models.Repositories.Interfaces;
using MultimediaNotes.API.Services.Interfaces;

namespace MultimediaNotes.API.Services
{
    public class MediaFileService : IMediaFileService
    {
        private readonly IMediaFileRepository _mediaFileRepository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _environment;
        private readonly string[] _allowedImageTypes = { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };
        private readonly string[] _allowedAudioTypes = { ".mp3", ".wav", ".ogg", ".m4a" };
        //private readonly string[] _allowedVideoTypes = { ".mp4", ".avi", ".mov", ".wmv", ".mkv" };
        private const long MaxFileSize = 50 * 1024 * 1024; // 50MB

        public MediaFileService(
            IMediaFileRepository mediaFileRepository,
            IMapper mapper,
            IWebHostEnvironment environment)
        {
            _mediaFileRepository = mediaFileRepository;
            _mapper = mapper;
            _environment = environment;
        }

        //GET
        public async Task<IEnumerable<MediaFileDTO>> GetFilesByAnnotationIdAsync(int annotationId)
        {
            var files = await _mediaFileRepository.GetByAnnotationIdAsync(annotationId);
            return _mapper.Map<IEnumerable<MediaFileDTO>>(files);
        }

        public async Task<MediaFileDTO> GetFileByIdAsync(int id)
        {
            var file = await _mediaFileRepository.GetByIdAsync(id);
            return _mapper.Map<MediaFileDTO>(file);
        }

        public async Task<Stream> GetFileStreamAsync(int id)
        {
            var file = await _mediaFileRepository.GetByIdAsync(id);
            if (file == null) return null;

            var fullPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, file.FilePath);
            if (!File.Exists(fullPath)) return null;

            return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        }


        //POST
        public async Task<MediaFileDTO> UploadFileAsync(MediaFileUploadDTO uploadDto)
        {
            if (uploadDto.File == null || uploadDto.File.Length == 0)
                throw new ArgumentException("Arquivo não fornecido");

            if (uploadDto.File.Length > MaxFileSize)
                throw new ArgumentException("Arquivo muito grande. Máximo 50MB");

            var fileExtension = Path.GetExtension(uploadDto.File.FileName).ToLowerInvariant();
            var fileType = GetFileType(fileExtension);

            if (string.IsNullOrEmpty(fileType))
                throw new ArgumentException("Tipo de arquivo não suportado");

            // Criar diretório se não existir
            var uploadPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", fileType);
            Directory.CreateDirectory(uploadPath);

            // Gerar nome único para o arquivo
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadPath, uniqueFileName);

            // Salvar arquivo
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await uploadDto.File.CopyToAsync(stream);
            }

            // Criar entidade MediaFile
            var mediaFile = new MediaFile
            {
                FileName = uploadDto.File.FileName,
                FilePath = Path.Combine("uploads", fileType, uniqueFileName),
                FileType = fileType,
                MimeType = uploadDto.File.ContentType,
                FileSize = uploadDto.File.Length,
                AnnotationId = uploadDto.AnnotationId
            };

            await _mediaFileRepository.CreateAsync(mediaFile);

            return _mapper.Map<MediaFileDTO>(mediaFile);
        }

        //DELETE
        public async Task<bool> DeleteFileAsync(int id)
        {
            var file = await _mediaFileRepository.GetByIdAsync(id);
            if (file == null) return false;

            // Deletar arquivo 
            var fullPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, file.FilePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }

            // Deletar do banco
            await _mediaFileRepository.DeleteAsync(id);
            return true;
        }

        
        //PRIVATE
        private string GetFileType(string extension)
        {
            if (_allowedImageTypes.Contains(extension)) return "image";
            if (_allowedAudioTypes.Contains(extension)) return "audio";
            //if (_allowedVideoTypes.Contains(extension)) return "video";
            return null;
        }
    }
}