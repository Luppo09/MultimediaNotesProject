using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Context;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.DTOs;
using AutoMapper;

namespace MultimediaNotes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnotationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public AnnotationController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Annotation
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AnnotationDTO>>> GetAnnotations()
        {
            var annotations = await _context.Annotations.Include(a => a.User).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<AnnotationDTO>>(annotations));
        }

        // GET: api/Annotation/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AnnotationDTO>> GetAnnotation(int id)
        {
            var annotation = await _context.Annotations.Include(a => a.User)
                                                       .FirstOrDefaultAsync(a => a.Id == id);

            if (annotation == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<AnnotationDTO>(annotation));
        }

        // PUT: api/Annotation/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAnnotation(int id, AnnotationDTO annotationDto)
        {
            if (id != annotationDto.Id)
            {
                return BadRequest();
            }

            var annotation = _mapper.Map<Annotation>(annotationDto);
            _context.Entry(annotation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AnnotationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Annotation
        [HttpPost]
        public async Task<ActionResult<AnnotationDTO>> PostAnnotation(AnnotationDTO annotationDto)
        {
            var annotation = _mapper.Map<Annotation>(annotationDto);
            _context.Annotations.Add(annotation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAnnotation), new { id = annotation.Id }, _mapper.Map<AnnotationDTO>(annotation));
        }

        // DELETE: api/Annotation/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnnotation(int id)
        {
            var annotation = await _context.Annotations.FindAsync(id);
            if (annotation == null)
            {
                return NotFound();
            }

            _context.Annotations.Remove(annotation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AnnotationExists(int id)
        {
            return _context.Annotations.Any(e => e.Id == id);
        }
    }
}
