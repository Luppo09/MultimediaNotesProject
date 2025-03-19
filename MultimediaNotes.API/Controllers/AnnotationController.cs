using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Context;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.DTOs;
using AutoMapper;
using MultimediaNotes.API.Services.Interfaces;

namespace MultimediaNotes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnotationController : ControllerBase
    {
        private readonly IAnnotationService _annotationsService;

        public AnnotationController(IAnnotationService annotationsService)
        {
            _annotationsService = annotationsService;
        }

        // GET: api/Annotation
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AnnotationDTO>>> GetAll()
        {
            var annotationsDTO = await _annotationsService.GetAllAnotations();
            if (annotationsDTO == null)
            {
                return NotFound("Annotations not found");
            }
            return Ok(annotationsDTO);
        }

        // GET: api/Annotation/5
        [HttpGet("{id:int}", Name = "GetAnnotation")]
        public async Task<ActionResult<AnnotationDTO>> Get(int id)
        {
            var annotationsDTO = await _annotationsService.GetAnnotationById(id);
            if (annotationsDTO == null)
            {
                return NotFound("annotation not found");
            }
            return Ok(annotationsDTO);
        }

        // GET: api/Annotation/user/5
        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<IEnumerable<AnnotationDTO>>> GetAnnotationsByUserId(int userId)
        {
            var annotationsDTO = await _annotationsService.GetAnnotationsByUserId(userId);

            if (annotationsDTO == null || !annotationsDTO.Any())
            {
                return NotFound("No annotations found for this user");
            }

            return Ok(annotationsDTO);
        }

        // POST: api/Annotation
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AnnotationDTO annotationDTO)
        {
            if (annotationDTO == null)
                return BadRequest("Invalid Data");

            await _annotationsService.CreateAnnotation(annotationDTO);

            return new CreatedAtRouteResult(
            "GetAnnotation",
            new { id = annotationDTO.Id },
            annotationDTO);
        }

        // PUT: api/Annotation/5
        [HttpPut()]
        public async Task<ActionResult<AnnotationDTO>> Put([FromBody] AnnotationDTO annotationDTO)
        {
            if (annotationDTO == null)
            {
                return BadRequest();
            }

            await _annotationsService.UpdateAnnotation(annotationDTO);

            return Ok(annotationDTO);
        }



        // DELETE: api/Annotation/5
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<AnnotationDTO>> Delete(int id)
        {
            var annotationDTO = await _annotationsService.GetAnnotationById(id);

            if (annotationDTO == null)
            {
                return NotFound("Annotation not found");
            }

            await _annotationsService.DeleteAnnotation(id);

            return Ok(annotationDTO);
        }
    }
}
