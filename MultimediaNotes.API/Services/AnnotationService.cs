using AutoMapper;
using MultimediaNotes.API.DTOs;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.Models.Repositories.Interfaces;
using MultimediaNotes.API.Services.Interfaces;

namespace MultimediaNotes.API.Services
{
    public class AnnotationService : IAnnotationService
    {
        private readonly IAnnotationRepository _annotationRepository;
        private readonly IMapper _mapper;

        public AnnotationService(IAnnotationRepository annotationRepository, IMapper mapper)
        {
            _annotationRepository = annotationRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AnnotationDTO>> GetAllAnotations()
        {
            var annotationsEntity = await _annotationRepository.GetAllAnotations();
            return _mapper.Map<IEnumerable<AnnotationDTO>>(annotationsEntity);
        }

        public async Task<AnnotationDTO> GetAnnotationById(int id)
        {
            var annotationsEntity = await _annotationRepository.GetAnnotationById(id);
            return _mapper.Map<AnnotationDTO>(annotationsEntity);
        }

        public async Task<IEnumerable<AnnotationDTO>> GetAnnotationsByUserId(int userId)
        {
            var annotationsEntity = await _annotationRepository.GetAnnotationsByUserId(userId);
            return _mapper.Map<IEnumerable<AnnotationDTO>>(annotationsEntity);
        }

        public async Task CreateAnnotation(AnnotationDTO annotationDTO)
        {
            var annotationsEntity = _mapper.Map<Annotation>(annotationDTO);
            await _annotationRepository.CreateAnnotation(annotationsEntity);
            annotationDTO.Id = annotationsEntity.Id;
        }

        public async Task UpdateAnnotation(AnnotationDTO annotationDTO)
        {
            var annotationsEntity = _mapper.Map<Annotation>(annotationDTO);
            await _annotationRepository.UpdateAnnotation(annotationsEntity);
        }

        public async Task DeleteAnnotation(int id)
        {
            var annotationsEntity = await _annotationRepository.GetAnnotationById(id);
            await _annotationRepository.DeleteAnnotation(annotationsEntity.Id);
        }
    }
}
