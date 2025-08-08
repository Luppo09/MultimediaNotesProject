using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MultimediaNotes.API.DTOs;
using MultimediaNotes.API.Services.Interfaces;

namespace MultimediaNotes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MediaFileController : ControllerBase
    {
        private readonly IMediaFileService _mediaFileService;

        //GET
        public MediaFileController(IMediaFileService mediaFileService)
        {
            _mediaFileService = mediaFileService;
        }

        [HttpGet("annotation/{annotationId:int}")]
        public async Task<ActionResult<IEnumerable<MediaFileDTO>>> GetFilesByAnnotation(int annotationId)
        {
            var files = await _mediaFileService.GetFilesByAnnotationIdAsync(annotationId);
            return Ok(files);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult> GetFile(int id)
        {
            var fileDto = await _mediaFileService.GetFileByIdAsync(id);
            if (fileDto == null)
                return NotFound();

            var stream = await _mediaFileService.GetFileStreamAsync(id);
            if (stream == null)
                return NotFound();

            return File(stream, fileDto.MimeType, fileDto.FileName);
        }

        //POST
        [HttpPost("upload")]
        public async Task<ActionResult<MediaFileDTO>> UploadFile([FromForm] MediaFileUploadDTO uploadDto)
        {
            try
            {
                var result = await _mediaFileService.UploadFileAsync(uploadDto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        
        //DELETE
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteFile(int id)
        {
            var result = await _mediaFileService.DeleteFileAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
