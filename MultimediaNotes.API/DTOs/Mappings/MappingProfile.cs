using AutoMapper;
using MultimediaNotes.API.Models;

namespace MultimediaNotes.API.DTOs.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDTO>().ReverseMap();
            CreateMap<Annotation, AnnotationDTO>().ReverseMap();
        }
    }
}
